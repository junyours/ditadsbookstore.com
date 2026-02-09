<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookAuthor extends Model
{
    protected $table = 'book_authors';

    protected $fillable = [
        'book_id',
        'user_id',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
