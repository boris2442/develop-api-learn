<?php

namespace App\Models;

use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
        use HasFactory;
   protected $fillable = [
        'user_id',
        'article_id',
        'content',
        'parent_id', // Ne pas oublier de l'ajouter ici
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    // Relation vers le commentaire parent (s'il s'agit d'une réponse)
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    // Relation vers les réponses enfants
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id')->with('user', 'replies'); 
        // Note: Le 'with' en cascade permet de charger les sous-réponses automatiquement si besoin
    }
}
