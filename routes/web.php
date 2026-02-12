<?php

use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StoreController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StoreController::class, 'home'])->name('store.home');
Route::get('/book/{title}', [StoreController::class, 'book'])->name('store.book');

Route::middleware(['role:customer'])->group(function () {
  Route::get('/cart', [CustomerController::class, 'cart'])->name('cart');
  Route::post('/cart/add', [CustomerController::class, 'addCart'])->name('add.cart');
  Route::post('/cart/remove', [CustomerController::class, 'removeCart'])->name('cart.remove');
  Route::post('/cart/quantity', [CustomerController::class, 'quantityCart'])->name('cart.quantity');

  Route::get('/checkout', [CustomerController::class, 'checkout'])->name('checkout');

  Route::post('/pay/checkout', [PaymentController::class, 'checkout'])
    ->name('payment.checkout');
  Route::get('/payment/success', [PaymentController::class, 'success'])
    ->name('payment.success');
  Route::get('/payment/cancel', [PaymentController::class, 'cancel'])
    ->name('payment.cancel');

  Route::get('/my-profile', [CustomerController::class, 'myProfile'])->name('my-profile');
  Route::get('/my-orders', [CustomerController::class, 'myOrder'])->name('my-order');
});

Route::middleware(['role:admin'])->group(function () {
  Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

  Route::get('/admin/books', [BookController::class, 'book']);
  Route::post('/admin/books/add', [BookController::class, 'addBook']);
  Route::post('/admin/books/update', [BookController::class, 'updateBook']);
  Route::post('/admin/books/delete', [BookController::class, 'deleteBook']);

  Route::get('/admin/orders', [OrderController::class, 'order']);
  Route::post('/admin/orders/change-status', [OrderController::class, 'orderChangeStatus']);

  Route::get('/admin/authors', [AuthorController::class, 'author']);
  Route::post('/admin/authors/add', [AuthorController::class, 'addAuthor']);
  Route::post('/admin/authors/update', [AuthorController::class, 'updateAuthor']);
  Route::post('/admin/authors/delete', [AuthorController::class, 'deleteAuthor']);

  Route::get('/admin/categories', [CategoryController::class, 'category']);
  Route::post('/admin/categories/add', [CategoryController::class, 'addCategory']);
  Route::post('/admin/categories/update', [CategoryController::class, 'updateCategory']);
  Route::post('/admin/categories/delete', [CategoryController::class, 'deleteCategory']);
});

require __DIR__ . '/auth.php';
