<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\CommentStoreRequest;
use App\Http\Resources\CommentResource;
use App\Models\Article;
use Illuminate\Http\Request;

class CommentController
{
//    public function store(CommentStoreRequest $request, Article $article)
//     {
//         $comment = $article->comments()->create([
//             'content' => $request->validated('content'),
//             'user_id' => 1, // Ou Auth::id() si l'utilisateur est authentifié
//         ]);

//         // Recharge la relation user pour l'afficher immédiatement
//         $comment->load('user');

//         return new CommentResource($comment);
//     }


public function store(CommentStoreRequest $request, Article $article)
{
    $comment = $article->comments()->create([
        'content' => $request->validated('content'),
        'parent_id' => $request->validated('parent_id'), // Enregistre l'ID du parent si c'est une réponse
        'user_id' => 1, // ou Auth::id()
    ]);

    $comment->load('user');

    return new CommentResource($comment);
}
}
