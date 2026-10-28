<?php


use App\Http\Controllers\Api\V1\PostController as V1PostController;
use App\Http\Controllers\Api\V2\PostController as V2PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/hello', function(){
return ['Hello, Laravel APi']; 
});
// Route::get('/posts', [PostController::class, 'index']);
// Route::get('posts/{id}', [PostController::class, 'show'])->name('show');
Route::prefix('v1')->group(function () {
    Route::apiResource('posts', V1PostController::class);
});
Route::prefix('v2')->group(function () {
    Route::apiResource('posts', V2PostController::class);
});
// Route::apiResource('posts', PostController::class);
