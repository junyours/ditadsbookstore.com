<?php

namespace App\Http\Controllers;

use App\Models\OrderPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PayMongoWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // Respond immediately (PayMongo requirement)
        response()->json(['received' => true], 200)->send();

        try {
            $payload = $request->getContent();
            $signature = $request->header('Paymongo-Signature');

            // Only verify signature in production
            // if (app()->environment('production')) {
            //     if (!$this->isValidSignature($payload, $signature)) {
            //         Log::warning('Invalid PayMongo Signature');
            //         return;
            //     }
            // }

            if (!$this->isValidSignature($payload, $signature)) {
                Log::warning('Invalid PayMongo Signature');
                return;
            }

            Log::info('PayMongo Webhook', $request->all());

            $event = data_get($request, 'data.attributes.type');

            match ($event) {
                'payment.paid' => $this->paymentPaid($request),
                'payment.failed' => $this->paymentFailed($request),
                default => Log::info('Unhandled event', [$event]),
            };

        } catch (\Throwable $e) {

            Log::error('PayMongo Webhook Exception', [
                'message' => $e->getMessage(),
            ]);
        }
    }

    private function isValidSignature($payload, $signatureHeader)
    {
        $secret = config('services.paymongo.webhook_secret');

        if (!$signatureHeader)
            return false;

        parse_str(str_replace(',', '&', $signatureHeader), $parts);

        if (!isset($parts['v1']))
            return false;

        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $parts['v1']);
    }

    private function paymentPaid(Request $request)
    {
        $checkoutSessionId = data_get($request, 'data.attributes.source.id');

        $orderPayment = OrderPayment::where('checkout_session_id', $checkoutSessionId)->first();

        if (!$orderPayment) {
            Log::warning('OrderPayment not found', [$checkoutSessionId]);
            return;
        }

        $orderPayment->update([
            'payment_reference' => data_get($request, 'data.id'),
            'payment_method' => data_get($request, 'data.attributes.payment_method_type'),
            'status' => 'paid',
        ]);

        $orderPayment->order()->update([
            'status' => 'preparing',
        ]);
    }

    private function paymentFailed(Request $request)
    {
        OrderPayment::where(
            'checkout_session_id',
            data_get($request, 'data.attributes.source.id')
        )->update([
                    'status' => 'failed',
                ]);
    }
}
