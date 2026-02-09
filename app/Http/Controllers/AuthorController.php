<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthorController extends Controller
{
    public function author(Request $request)
    {
        $search = $request->input('search');

        $authors = User::where('role', 'author')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('app/author', [
            'search' => $search,
            'authors' => $authors
        ]);
    }

    public function addAuthor(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'unique:users,name'],
            'email' => ['required', 'email', 'unique:users,email'],
        ]);

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make(Str::random(8)),
            'role' => 'author',
        ]);
    }

    public function updateAuthor(Request $request)
    {
        $author = User::findOrFail($request->input('id'));

        $data = $request->validate([
            'name' => ['required', 'string', 'unique:users,name,' . $request->input('id')],
            'email' => ['required', 'email', 'unique:users,email,' . $request->input('id')],
        ]);

        $author->update([
            'name' => $data['name'],
            'email' => $data['email']
        ]);
    }

    public function deleteAuthor(Request $request)
    {
        $author = User::findOrFail($request->input('id'));

        $author->delete();
    }
}
