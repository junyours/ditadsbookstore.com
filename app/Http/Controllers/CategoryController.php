<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function category(Request $request)
    {
        $search = $request->input('search');

        $categories = Category::when($search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
        })
            ->latest()
            ->paginate(10);

        return Inertia::render('app/category', [
            'search' => $search,
            'categories' => $categories
        ]);
    }

    public function addCategory(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'unique:categories,name'],
        ]);

        Category::create([
            'name' => $data['name'],
        ]);
    }

    public function updateCategory(Request $request)
    {
        $author = Category::findOrFail($request->input('id'));

        $data = $request->validate([
            'name' => ['required', 'string', 'unique:categories,name,' . $request->input('id')],
        ]);

        $author->update([
            'name' => $data['name'],
        ]);
    }

    public function deleteCategory(Request $request)
    {
        $author = Category::findOrFail($request->input('id'));

        $author->delete();
    }
}
