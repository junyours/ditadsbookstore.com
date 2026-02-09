<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingAddress extends Model
{
    protected $table = 'shipping_addresses';

    protected $fillable = [
        'user_id',
        'region',
        'province',
        'municipality',
        'barangay',
        'street',
        'postal_code',
        'phone_number',
    ];
}
