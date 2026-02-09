<?php

namespace App\Http\Controllers;

use App\Http\Requests\PayMongoRequest;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderBook;
use App\Models\OrderPayment;
use App\Models\OrderShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function checkout(Request $request, PayMongoRequest $paymongo)
    {
        $user_id = $request->user()->id;
        $items = $request->items;

        $order = Order::create([
            'user_id' => $user_id,
            'order_number' => $this->generateUniqueOrderNumber(),
            'status' => 'to_pay',
        ]);

        $lineItems = collect($items)->map(function ($item) {
            return [
                'name' => $item['book']['title'],
                'quantity' => $item['quantity'],
                'amount' => (int) ((float) $item['book']['price'] * 100),
                'currency' => 'PHP',
            ];
        })->values()->toArray();

        $response = $paymongo->createCheckout([
            'data' => [
                'attributes' => [
                    'line_items' => $lineItems,
                    'payment_method_types' => [
                        'qrph',
                        // 'card',
                        // 'gcash',
                        // 'paymaya',
                    ],
                    'success_url' => route('payment.success'),
                    'cancel_url' => route('payment.cancel', ['order_id' => $order->id]),
                ],
            ],
        ]);

        $checkoutData = $response['data'] ?? null;

        if (!$checkoutData) {
            return response()->json([
                'error' => 'Unable to create checkout session',
                'response' => $response,
            ], 500);
        }

        foreach ($items as $item) {
            OrderBook::create([
                'order_id' => $order->id,
                'book_id' => $item['book']['id'],
                'price' => $item['book']['price'],
                'quantity' => $item['quantity'],
            ]);
        }

        OrderPayment::create([
            'order_id' => $order->id,
            'checkout_session_id' => $response['data']['id'],
            'status' => 'pending',
        ]);

        OrderShippingAddress::create([
            'order_id' => $order->id,
            'region' => $request->input('data.region'),
            'province' => $request->input('data.province'),
            'municipality' => $request->input('data.municipality'),
            'barangay' => $request->input('data.barangay'),
            'street' => $request->input('data.street'),
            'postal_code' => $request->input('data.postal_code'),
            'phone_number' => $request->input('data.phone_number'),
        ]);

        Cart::where('user_id', $user_id)->delete();

        return response()->json([
            'checkout_url' => $response['data']['attributes']['checkout_url'],
        ]);
    }

    public function success()
    {
        return Inertia::render('store/my-order');
    }

    public function cancel(Request $request)
    {
        $orderId = $request->query('order_id');

        if ($orderId) {
            $order = Order::find($orderId);
            if ($order && $order->status === 'to_pay') {
                $order->update([
                    'status' => 'cancelled',
                ]);

                $order->orderPayment()->update([
                    'status' => 'failed',
                ]);
            }
        }

        return Inertia::render('store/my-order');
    }

    private function generateUniqueOrderNumber()
    {
        do {
            $orderNumber = 'ORD-' . strtoupper(Str::random(12));
        } while (
            Order::where('order_number', $orderNumber)->exists()
        );

        return $orderNumber;
    }
}
