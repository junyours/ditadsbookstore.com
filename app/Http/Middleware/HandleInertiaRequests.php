<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'cartCount' => function () {
                $user = Auth::user();
                return $user
                    ? Cart::where('user_id', $user->id)->sum('quantity')
                    : 0;
            },
            'search' => fn() => $request->query('search'),
            'cartBook' => function () use ($request) {
                $cartBook = $request->session()->get('cartBook');
                $request->session()->forget('cartBook');
                return $cartBook;
            },
        ];
    }
}
