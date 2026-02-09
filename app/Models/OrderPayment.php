<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderPayment extends Model
{
    protected $table = 'order_payments';

    protected $fillable = [
        'order_id',
        'checkout_session_id',
        'payment_reference',
        'payment_method',
        'status',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
