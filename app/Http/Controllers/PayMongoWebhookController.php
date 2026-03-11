<?php

namespace App\Http\Controllers;

use App\Models\OrderPayment;
use Illuminate\Http\Request;

class PayMongoWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Paymongo-Signature');
        $webhookSecret = config('services.paymongo.webhook_secret');

        if (!$this->verifySignature($payload, $signature, $webhookSecret)) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $event = json_decode($payload, true);
        $type = $event['data']['attributes']['type'];

        if ($type === 'payment.paid') {
            $this->paymentPaid($event);
        }

        if ($type === 'payment.failed') {
            $this->paymentFailed($event);
        }

        return response()->json(['status' => 'ok'], 200);
    }

    private function verifySignature($payload, $signature, $secret)
    {
        parse_str(str_replace(',', '&', $signature), $parts);
        $timestamp = $parts['t'];
        $signatureHash = $parts['li'];

        $signedPayload = "{$timestamp}.{$payload}";
        $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

        return hash_equals($expectedSignature, $signatureHash);
    }

    private function paymentPaid($event)
    {
        $orderId = data_get($event, 'data.attributes.data.attributes.metadata.order_id');

        $payment = OrderPayment::where('order_id', $orderId)->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        $payment->update([
            'payment_reference' => data_get($event, 'data.attributes.data.id'),
            'payment_method' => data_get($event, 'data.attributes.data.attributes.source.type'),
            'status' => 'paid',
        ]);

        $payment->order()->update([
            'status' => 'preparing'
        ]);
    }

    private function paymentFailed($event)
    {
        $orderId = data_get($event, 'data.attributes.data.attributes.metadata.order_id');

        $payment = OrderPayment::where('order_id', $orderId)->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        $payment->update([
            'status' => 'failed'
        ]);
    }
}
