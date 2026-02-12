<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderCourier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function order()
    {
        $orders = Order::with(['user', 'orderBook.book', 'orderPayment', 'orderShippingAddress', 'orderCourier'])
            ->get();

        return Inertia::render('app/order', [
            'orders' => $orders
        ]);
    }

    public function orderChangeStatus(Request $request)
    {
        $order = Order::findOrFail($request->input('order_id'));

        $order->update([
            'status' => $request->input('status')
        ]);

        OrderCourier::firstOrCreate(
            [
                'order_id' => $order->id,
            ],
            [
                'tracking_number' => $request->input('tracking_number'),
                'name' => $request->input('name'),
            ]
        );
    }

}
