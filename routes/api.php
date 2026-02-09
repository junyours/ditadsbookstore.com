<?php

use App\Http\Controllers\PayMongoWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/paymongo/webhook', [PayMongoWebhookController::class, 'handle']);

