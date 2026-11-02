<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
      public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'image' => $this->image,
            'comments_count' => $this->whenCounted('comments'),

            'user' => new UserResource(
                $this->whenLoaded('user')
            ),

            'category' => [
                'id' => $this->category?->id,
                'name' => $this->category?->name,
            ],

            'comments' => CommentResource::collection(
                $this->whenLoaded('comments')
            ),
        ];
    }
}
