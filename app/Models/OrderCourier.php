<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCourier extends Model
{
    protected $table = 'order_couriers';

    protected $fillable = [
        'order_id',
        'tracking_number',
        'name',
    ];
}
