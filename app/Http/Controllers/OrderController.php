<?php

namespace App\Http\Controllers;

use App\Models\Order;
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
}
