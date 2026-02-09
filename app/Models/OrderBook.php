<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderBook extends Model
{
    protected $table = 'order_books';

    protected $fillable = [
        'order_id',
        'book_id',
        'price',
        'quantity',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }
}
