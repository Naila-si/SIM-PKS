<?php

namespace App\Traits;

use App\Models\SystemLog;
use Illuminate\Support\Facades\Auth;

trait LogsSystemActivity
{
    public static function bootLogsSystemActivity()
    {
        static::created(function ($model) {
            self::recordLog($model, 'created');
        });

        static::updated(function ($model) {
            self::recordLog($model, 'updated');
        });

        static::deleted(function ($model) {
            self::recordLog($model, 'deleted');
        });
    }

    protected static function recordLog($model, $action)
    {
        // Don't log if running in console without user, unless we want to
        $userId = Auth::id() ?? request()->user()?->penggunaId ?? request()->input('user_id') ?? null;
        
        if (!$userId) {
            $token = request()->bearerToken();
            if ($token && preg_match('/sim-pks-token-(\d+)-/', $token, $matches)) {
                $userId = $matches[1];
            }
        }
        
        $oldValues = in_array($action, ['updated', 'deleted']) ? $model->getOriginal() : null;
        if (empty($oldValues) && $action === 'deleted') {
            $oldValues = $model->getAttributes();
        }
        
        $newValues = $action !== 'deleted' ? $model->getAttributes() : null;

        // Try to get bidang from the model itself or the user
        $bidang = $model->bidang ?? null;
        if (!$bidang && $userId) {
            $user = \App\Models\Pengguna::find($userId);
            $bidang = $user ? $user->bidang : null;
        }

        $className = class_basename($model);
        $desc = "Memperbarui {$className}";
        if ($action === 'created') $desc = "Membuat {$className} baru";
        if ($action === 'deleted') $desc = "Menghapus {$className}";

        // If it's an update, let's filter only changed attributes for cleaner logs
        if ($action === 'updated') {
            $changes = $model->getChanges();
            $oldValues = array_intersect_key($model->getOriginal(), $changes);
            $newValues = $changes;
        }

        SystemLog::create([
            'user_id' => $userId,
            'bidang' => $bidang,
            'action' => $action,
            'loggable_type' => get_class($model),
            'loggable_id' => $model->getKey(),
            'description' => $desc,
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
