<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\ArticleStoreRequest;
use App\Http\Requests\ArticleUpdateRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;



class ArticleController
{
     public function index()
    {
        $articles = Article::with(['user', 'category'])
            ->withCount('comments')
            ->inRandomOrder()
            // ->orderByRaw('CRC32(CONCAT(id, ?))', ['nexora-feed'])
            ->paginate(10);

     return ArticleResource::collection($articles);
    }


// public function show(Article $article)
//     {
//         // Charge l'article, son auteur, sa catégorie, les commentaires (et l'auteur de chaque commentaire)
//         $article->load(['user', 'category', 'comments.user'])
//                 ->loadCount('comments'); //permet de 

//         return new ArticleResource($article);
//     }


public function show(Article $article)
{
    $article->load([
        'user', 
        'category', 
        // On charge uniquement les commentaires de premier niveau avec leur auteur et leurs réponses
        'comments' => function ($query) {
            $query->whereNull('parent_id')
                  ->with(['user', 'replies.user'])
                  ->latest();
        }
    ])->loadCount('comments');

    return new ArticleResource($article);
}


    public function store(ArticleStoreRequest $request)
{
    $validated = $request->validated();

    // Générer le slug à partir du titre
    $validated['slug'] = Str::slug($validated['title']);

    // Enregistrer l'image
    if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')
            ->store('articles', 'public');
    }

    // Définir un utilisateur existant comme auteur
    $validated['user_id'] = 1;

    // Créer l'article
    $article = Article::create($validated);

    return new ArticleResource($article->load([
        'user',
        'category',
    ]));
}
    



public function update(ArticleUpdateRequest $request, Article $article)
{
    $validated = $request->validated();

    // Conserver le chemin de l'ancienne image
    $oldImage = $article->image;

    // Générer le nouveau slug à partir du titre
    $validated['slug'] = Str::slug($validated['title']);

    // Vérifier si une nouvelle image a été envoyée
    if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')
            ->store('articles', 'public');
    }

    // Mettre à jour l'article
    $article->update($validated);

    // Supprimer l'ancienne image si elle a été remplacée
    if ($request->hasFile('image') && $oldImage) {
        Storage::disk('public')->delete($oldImage);
    }

    // Retourner l'article actualisé
    $article->load(['user', 'category', 'comments.user'])
            ->loadCount('comments');

    return new ArticleResource($article);
}

}
