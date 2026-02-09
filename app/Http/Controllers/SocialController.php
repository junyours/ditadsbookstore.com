<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialController extends Controller
{
    public function redirect($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider)
    {
        try {
            $socialUser = Socialite::driver($provider)
                ->stateless()
                ->user();

            $user = User::updateOrCreate(
                [
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                ],
                [
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'email' => $socialUser->getEmail(),
                    'avatar' => $socialUser->getAvatar(),
                    'provider_token' => $socialUser->token,
                    'provider_refresh_token' => $socialUser->refreshToken,
                ]
            );

            Auth::login($user);

            return redirect()->route('store.home');

        } catch (\Throwable $e) {
            return redirect()
                ->route('login')
                ->with('error', 'Sign in failed. Please try again.');
        }
    }
}
