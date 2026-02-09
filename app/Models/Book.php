<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $table = 'books';

    protected $fillable = [
        'isbn',
        'image',
        'title',
        'description',
        'price',
        'published_at',
        'number_page',
    ];

    public function users()
    {
        return $this->belongsToMany(
            User::class,
            'book_authors',
            'book_id',
            'user_id'
        );
    }

    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'book_categories',
            'book_id',
            'category_id'
        );
    }

    public function cart()
    {
        return $this->hasMany(Cart::class, 'book_id');
    }
}
