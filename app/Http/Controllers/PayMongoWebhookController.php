<?php

namespace App\Http\Controllers;

use App\Models\OrderPayment;
use Illuminate\Http\Request;

class PayMongoWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $secret = config('services.paymongo.webhook_secret');

        $payload = $request->getContent();
        $event = json_decode($payload, true);

        $signature = $request->header('Paymongo-Signature');

        $parts = explode(',', $signature);
        $timestamp = explode('=', $parts[0])[1];
        $sig = explode('=', $parts[1])[1];

        $signedPayload = $timestamp . '.' . $payload;
        $computed = hash_hmac('sha256', $signedPayload, $secret);

        if (!hash_equals($computed, $sig)) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $type = data_get($event, 'data.attributes.type');

        match ($type) {
            'payment.paid' => $this->paymentPaid($event),
            'payment.failed' => $this->paymentFailed($event),
            default => null,
        };

        return response()->json(['status' => 'ok'], 200);
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
