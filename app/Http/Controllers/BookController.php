<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookAuthor;
use App\Models\BookCategory;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class BookController extends Controller
{
    public function book(Request $request)
    {
        $search = $request->input('search');

        $authors = User::select('id as value', 'name as label')
            ->where('role', 'author')
            ->latest()
            ->get();

        $categories = Category::select('id as value', 'name as label')
            ->latest()
            ->get();

        $books = Book::with([
            'users' => function ($query) {
                $query->where('role', 'author');
            },
            'categories'
        ])
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('app/book', [
            'search' => $search,
            'authors' => $authors,
            'categories' => $categories,
            'books' => $books
        ]);
    }

    public function addBook(Request $request)
    {
        $accessToken = $this->token();

        $data = $request->validate([
            'isbn' => ['required', 'string', 'unique:books,isbn'],
            'image' => ['required', 'mimes:jpeg,jpg,png'],
            'title' => ['required', 'string'],
            'description' => ['required', 'string'],
            'price' => ['required', 'string'],
            'published_at' => ['required', 'date'],
            'number_page' => ['required', 'string'],
            'authors' => ['required', 'array', 'min:1'],
            'categories' => ['required', 'array', 'min:1'],
        ]);

        $folderId = $this->getOrCreateFolder($accessToken, 'Books', config('services.google_drive.folder_id'));

        $file = $request->file('image');
        $mimeType = $file->getMimeType();

        $metadata = [
            'name' => 'temp_' . time(),
            'parents' => [$folderId],
        ];

        $uploadResponse = Http::withToken($accessToken)
            ->attach('metadata', json_encode($metadata), 'metadata.json', ['Content-Type' => 'application/json'])
            ->attach('media', file_get_contents($file), $file->getClientOriginalName(), ['Content-Type' => $mimeType])
            ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');

        if ($uploadResponse->successful()) {
            $fileId = $uploadResponse->json()['id'];

            Http::withToken($accessToken)->patch("https://www.googleapis.com/drive/v3/files/{$fileId}", [
                'name' => $fileId,
            ]);

            Http::withToken($accessToken)->post("https://www.googleapis.com/drive/v3/files/{$fileId}/permissions", [
                'role' => 'reader',
                'type' => 'anyone',
            ]);

            $book = Book::create([
                'isbn' => $data['isbn'],
                'image' => $fileId,
                'title' => $data['title'],
                'description' => $data['description'],
                'price' => $data['price'],
                'published_at' => Carbon::parse($data['published_at'])
                    ->timezone('Asia/Manila')
                    ->toDateString(),
                'number_page' => $data['number_page'],
            ]);

            foreach ($data['authors'] as $author) {
                BookAuthor::create([
                    'book_id' => $book->id,
                    'user_id' => $author['value'],
                ]);
            }

            foreach ($data['categories'] as $category) {
                BookCategory::create([
                    'book_id' => $book->id,
                    'category_id' => $category['value'],
                ]);
            }
        }
    }

    public function updateBook(Request $request)
    {
        $accessToken = $this->token();

        $book = Book::findOrFail($request->input('id'));

        $data = $request->validate([
            'isbn' => ['required', 'string', 'unique:books,isbn,' . $request->input('id')],
            'image' => ['nullable', 'mimes:jpeg,jpg,png'],
            'title' => ['required', 'string'],
            'description' => ['required', 'string'],
            'price' => ['required', 'string'],
            'published_at' => ['required', 'date'],
            'number_page' => ['required', 'string'],
            'authors' => ['required', 'array', 'min:1'],
            'categories' => ['required', 'array', 'min:1'],
        ]);

        $fileId = $book->image;

        if ($request->hasFile('image')) {
            $folderId = $this->getOrCreateFolder($accessToken, 'Books', config('services.google_drive.folder_id'));

            $file = $request->file('image');
            $mimeType = $file->getMimeType();

            $metadata = [
                'name' => 'temp_' . time(),
                'parents' => [$folderId],
            ];

            $uploadResponse = Http::withToken($accessToken)
                ->attach('metadata', json_encode($metadata), 'metadata.json', ['Content-Type' => 'application/json'])
                ->attach('media', file_get_contents($file), $file->getClientOriginalName(), ['Content-Type' => $mimeType])
                ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');

            if ($uploadResponse->successful()) {
                $newFileId = $uploadResponse->json()['id'];

                Http::withToken($accessToken)->patch("https://www.googleapis.com/drive/v3/files/{$newFileId}", [
                    'name' => $newFileId,
                ]);

                Http::withToken($accessToken)->post("https://www.googleapis.com/drive/v3/files/{$newFileId}/permissions", [
                    'role' => 'reader',
                    'type' => 'anyone',
                ]);

                Http::withToken($accessToken)->delete("https://www.googleapis.com/drive/v3/files/{$fileId}");

                $fileId = $newFileId;
            }
        }

        $book->fill([
            'isbn' => $data['isbn'],
            'image' => $fileId,
            'title' => $data['title'],
            'description' => $data['description'],
            'price' => $data['price'],
            'published_at' => Carbon::parse($data['published_at'])
                ->timezone('Asia/Manila')
                ->toDateString(),
            'number_page' => $data['number_page'],
        ]);

        $book->save();

        if ($request->filled('authors')) {
            BookAuthor::where('book_id', $book->id)->delete();

            foreach ($data['authors'] as $author) {
                BookAuthor::create([
                    'book_id' => $book->id,
                    'user_id' => $author['value'],
                ]);
            }
        }

        if ($request->filled('categories')) {
            BookCategory::where('book_id', $book->id)->delete();

            foreach ($data['categories'] as $category) {
                BookCategory::create([
                    'book_id' => $book->id,
                    'category_id' => $category['value'],
                ]);
            }
        }
    }

    public function deleteBook(Request $request)
    {
        $book = Book::findOrFail($request->input('id'));
        $accessToken = $this->token();

        Http::withToken($accessToken)->delete("https://www.googleapis.com/drive/v3/files/{$book->image}");

        BookAuthor::where('book_id', $book->id)->delete();

        BookCategory::where('book_id', $book->id)->delete();

        $book->delete();
    }
}
