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
        $signature = $request->header('Paymongo-Signature');
        $secret = config('services.paymongo.webhook_secret');

        if (!$this->isValidSignature($payload, $signature, $secret)) {
            return response()->json(['message' => 'Error Paymongo Signature'], 400);
        }

        $event = $request->input('data.attributes.type');

        match ($event) {
            'payment.paid' => $this->paymentPaid($request),
            'payment.failed' => $this->paymentFailed($request),
            default => null,
        };

        return response()->json(['message' => 'Success Paymongo Signature'], 200);
    }

    private function isValidSignature($payload, $signature, $secret)
    {
        $expected = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected, $signature);
    }

    private function paymentPaid(Request $request)
    {
        $paymentId = $request->input('data.id');
        $checkoutSessionId = $request->input('data.attributes.source.id');
        $paymentMethodType = $request->input('data.attributes.payment_method_type');

        $orderPayment = OrderPayment::where(
            'checkout_session_id',
            $checkoutSessionId
        )->first();

        $orderPayment->update([
            'payment_reference' => $paymentId,
            'payment_method' => $paymentMethodType,
            'status' => 'paid',
        ]);

        $orderPayment->order()->update([
            'status' => 'preparing',
        ]);
    }

    private function paymentFailed(Request $request)
    {
        $checkoutSessionId = $request->input('data.attributes.source.id');

        OrderPayment::where('checkout_session_id', $checkoutSessionId)
            ->update([
                'status' => 'failed',
            ]);
    }
}
