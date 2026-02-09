<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Log;

abstract class Controller
{
    public function token()
    {
        try {
            $response = Http::asForm()
                ->timeout(10)
                ->post('https://oauth2.googleapis.com/token', [
                    'client_id' => config('services.google_drive.client_id'),
                    'client_secret' => config('services.google_drive.client_secret'),
                    'refresh_token' => config('services.google_drive.refresh_token'),
                    'grant_type' => 'refresh_token',
                ]);

            if (!$response->successful()) {
                return back()->with(
                    'error',
                    'Unable to connect to Google services. Please try again.'
                );
            }

            return $response->json()['access_token'];

        } catch (ConnectionException $e) {
            Log::error('Google token connection error', [
                'message' => $e->getMessage(),
            ]);

            return back()->with(
                'error',
                'Network error detected. Please check your internet connection.'
            );
        }
    }

    public function getOrCreateFolder($accessToken, $folderName, $parentId)
    {
        try {
            $response = Http::withToken($accessToken)
                ->timeout(10)
                ->get('https://www.googleapis.com/drive/v3/files', [
                    'q' => "name='{$folderName}' and '{$parentId}' in parents 
                            and mimeType='application/vnd.google-apps.folder' 
                            and trashed=false",
                    'fields' => 'files(id)',
                ]);

            if ($response->successful() && count($response['files']) > 0) {
                return $response['files'][0]['id'];
            }

            $create = Http::withToken($accessToken)
                ->timeout(10)
                ->post('https://www.googleapis.com/drive/v3/files', [
                    'name' => $folderName,
                    'mimeType' => 'application/vnd.google-apps.folder',
                    'parents' => [$parentId],
                ]);

            if (!$create->successful()) {
                return back()->with(
                    'error',
                    'Failed to create folder. Please try again.'
                );
            }

            return $create->json()['id'];

        } catch (ConnectionException $e) {
            Log::error('Google Drive connection error', [
                'message' => $e->getMessage(),
            ]);

            return back()->with(
                'error',
                'Slow or no internet connection. Please try again later.'
            );
        }
    }
}
