<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Comment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        Article::factory()
            ->count(100)
            ->create()
            ->each(function (Article $article) {
                Comment::factory()
                    ->count(20)
                    ->create([
                        'article_id' => $article->id,
                    ]);
            });
    }
}
