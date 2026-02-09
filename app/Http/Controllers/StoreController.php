<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function Home(Request $request)
    {
        $categoryNames = $request->input('categories', []);
        $search = $request->input('search');

        $categories = Category::has('books')
            ->withCount('books')
            ->orderByDesc('books_count')
            ->get();

        $books = Book::with('categories')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(!empty($categoryNames), function ($query) use ($categoryNames) {
                $query->whereHas('categories', function ($q) use ($categoryNames) {
                    $q->whereIn('categories.name', $categoryNames);
                });
            })
            ->latest()
            ->get();

        return Inertia::render('store/home', [
            'books' => $books,
            'categories' => $categories,
            'activeCategories' => $categoryNames,
            'search' => $search,
        ]);
    }

    public function book($title)
    {
        $book = Book::with([
            'users' => function ($query) {
                $query->where('role', 'author');
            },
        ])
            ->where('title', $title)->first();

        if (!$book) {
            abort(404);
        }

        return Inertia::render('store/book', [
            'book' => $book
        ]);
    }
}
