<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookCategory extends Model
{
    protected $table = 'book_categories';

    protected $fillable = [
        'book_id',
        'category_id',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
