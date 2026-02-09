<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Http;

class PayMongoRequest
{
    protected $baseUrl = 'https://api.paymongo.com/v1';

    protected function request()
    {
        return Http::withBasicAuth(
            config('services.paymongo.secret_key'),
            ''
        )->acceptJson();
    }

    public function createCheckout(array $data)
    {
        return $this->request()->post(
            $this->baseUrl . '/checkout_sessions',
            $data
        )->json();
    }
}
