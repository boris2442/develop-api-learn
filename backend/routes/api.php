<?php


use App\Http\Controllers\Api\V1\ArticleController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CommentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Routes publiques (Accessibles sans être connecté)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par Sanctum (Nécessite le token Bearer)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});










Route::get('/articles', [ArticleController::class, 'index']);
// Route pour afficher un article unique via son slug
// Route pour créer un nouvel article
Route::post('/articles', [ArticleController::class, 'store']);
//Route::get('/articles/create', [ArticleController::class, 'create']);
Route::get('/articles/{article:slug}', [ArticleController::class, 'show']);
Route::put('/articles/{article:slug}', [ArticleController::class, 'update']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/articles/{article}/comments', [CommentController::class, 'store']);


// Routes protégées par l'authentification (Sanctum / Passport)
Route::middleware('auth:sanctum')->group(function () {
    
    // Route pour supprimer un article (avec vérification que l'utilisateur en est l'auteur)
    Route::delete('/articles/{article}', [ArticleController::class, 'destroy']);

    // Route pour mettre à jour la photo de profil (avatar)
    Route::post('/user/avatar', [AuthController::class, 'updateAvatar']);
    
});
