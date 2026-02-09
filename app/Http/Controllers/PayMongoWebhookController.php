<?php

namespace App\Http\Controllers;

use App\Models\OrderPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PayMongoWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signatureHeader = $request->header('Paymongo-Signature');
        $secret = config('services.paymongo.webhook_secret');

        // Log everything for debugging
        Log::info('PayMongo Webhook Received', [
            'headers' => $request->headers->all(),
            'body' => $request->all(),
        ]);

        if (!$this->isValidSignature($payload, $signatureHeader, $secret)) {
            Log::error('Invalid PayMongo Signature');

            return response()->json([
                'message' => 'Invalid PayMongo signature'
            ], 400);
        }

        $event = data_get($request->all(), 'data.attributes.type');

        match ($event) {
            'payment.paid' => $this->paymentPaid($request),
            'payment.failed' => $this->paymentFailed($request),
            default => Log::warning('Unhandled PayMongo event', ['event' => $event]),
        };

        return response()->json(['message' => 'Webhook processed']);
    }

    private function isValidSignature($payload, $signatureHeader, $secret)
    {
        if (!$signatureHeader || !$secret)
            return false;

        // Convert: t=123,v1=abc → array
        parse_str(str_replace(',', '&', $signatureHeader), $parts);

        if (!isset($parts['t']) || !isset($parts['v1']))
            return false;

        $signedPayload = $parts['t'] . '.' . $payload;

        $expected = hash_hmac('sha256', $signedPayload, $secret);

        return hash_equals($expected, $parts['v1']);
    }

    private function paymentPaid(Request $request)
    {
        $paymentId = data_get($request->all(), 'data.id');
        $checkoutSessionId = data_get($request->all(), 'data.attributes.source.id');
        $paymentMethodType = data_get($request->all(), 'data.attributes.payment_method_type');

        $orderPayment = OrderPayment::where('checkout_session_id', $checkoutSessionId)->first();

        if (!$orderPayment) {
            Log::error('OrderPayment not found', [
                'checkout_session_id' => $checkoutSessionId
            ]);
            return;
        }

        $orderPayment->update([
            'payment_reference' => $paymentId,
            'payment_method' => $paymentMethodType,
            'status' => 'paid',
        ]);

        $orderPayment->order()->update([
            'status' => 'preparing',
        ]);

        Log::info('Payment marked as PAID', [
            'checkout_session_id' => $checkoutSessionId
        ]);
    }

    private function paymentFailed(Request $request)
    {
        $checkoutSessionId = data_get($request->all(), 'data.attributes.source.id');

        OrderPayment::where('checkout_session_id', $checkoutSessionId)
            ->update([
                'status' => 'failed',
            ]);

        Log::info('Payment marked as FAILED', [
            'checkout_session_id' => $checkoutSessionId
        ]);
    }
}
