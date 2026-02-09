<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderShippingAddress extends Model
{
    protected $table = 'order_shipping_addresses';

    protected $fillable = [
        'order_id',
        'region',
        'province',
        'municipality',
        'barangay',
        'street',
        'postal_code',
        'phone_number',
    ];
}
