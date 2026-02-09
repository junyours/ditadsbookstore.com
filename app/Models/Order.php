<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function orderBook()
    {
        return $this->hasMany(OrderBook::class, 'order_id');
    }

    public function orderPayment()
    {
        return $this->hasOne(OrderPayment::class, 'order_id');
    }

    public function orderShippingAddress()
    {
        return $this->hasOne(OrderShippingAddress::class, 'order_id');
    }

    public function orderCourier()
    {
        return $this->hasOne(OrderCourier::class, 'order_id');
    }
}
