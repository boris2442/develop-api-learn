<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       return response()->json([
            'message' => 'Hello, Laravel API v1',
            'data' => [
                'posts' => [
                    ['id' => 1, 'title' => 'Post 1', 'content' => 'Content of Post 1'],
                    ['id' => 2, 'title' => 'Post 2', 'content' => 'Content of Post 2'],
                    ['id' => 3, 'title' => 'Post 3', 'content' => 'Content of Post 3'],
                ],
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
