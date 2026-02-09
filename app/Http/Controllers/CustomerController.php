<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Cart;
use App\Models\Order;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function cart(Request $request)
    {
        $user_id = $request->user()->id;

        $carts = Cart::where('user_id', $user_id)
            ->with([
                'book.users' => function ($query) {
                    $query->where('role', 'author');
                }
            ])
            ->latest()
            ->get();

        return Inertia::render('store/cart', [
            'carts' => $carts
        ]);
    }

    public function addCart(Request $request)
    {
        $user_id = $request->user()->id;
        $quantity = $request->input('quantity', 1);

        $cart = Cart::where('user_id', $user_id)
            ->where('book_id', $request->input('book_id'))
            ->first();

        if ($cart) {
            $cart->increment('quantity', $quantity);
        } else {
            Cart::create([
                'user_id' => $user_id,
                'book_id' => $request->input('book_id'),
                'quantity' => $quantity,
            ]);
        }

        $cartBook = Book::find($request->input('book_id'));

        return back()->with('cartBook', $cartBook);
    }

    public function removeCart(Request $request)
    {
        Cart::findOrFail($request->input('cart_id'))->delete();
    }

    public function quantityCart(Request $request)
    {
        $cart = Cart::findOrFail($request->input('cart_id'));
        $cart->update([
            'quantity' => $request->input('quantity'),
        ]);
    }

    public function checkout(Request $request)
    {
        $user_id = $request->user()->id;

        $address = ShippingAddress::where('user_id', $user_id)
            ->first();

        $items = Cart::where('user_id', $user_id)
            ->with('book')
            ->latest()
            ->get();

        if ($items->isEmpty()) {
            abort(404);
        }

        return Inertia::render('store/checkout', [
            'items' => $items,
            'address' => $address,
        ]);
    }

    public function myOrder(Request $request)
    {
        $user_id = $request->user()->id;

        $orders = Order::where('user_id', $user_id)
            ->with(['user', 'orderBook.book', 'orderPayment', 'orderShippingAddress', 'orderCourier'])
            ->get();

        return Inertia::render('store/my-order', [
            'orders' => $orders
        ]);
    }

    public function myProfile()
    {
        return Inertia::render('store/my-profile');
    }
}
