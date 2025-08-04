<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with(['user' => function($q) {
            $q->select('id', 'name', 'lastName', 'email');
        }])->orderBy('created_at', 'desc');

        // Filtros opcionales
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        if ($request->has('model_type') && $request->model_type) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filtro de días recientes (por defecto últimos 30 días si no se especifica rango)
        if (!$request->has('date_from') && !$request->has('date_to')) {
            $days = $request->get('recent_days', 30);
            $query->recent($days);
        }

        $perPage = $request->get('per_page', 15);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ]
        ]);
    }

    public function show($id)
    {
        $log = ActivityLog::with(['user' => function($q) {
            $q->select('id', 'name', 'lastName', 'email');
        }])->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Log de actividad no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $log
        ]);
    }

    public function getStats(Request $request)
    {
        $days = $request->get('days', 30);
        
        $stats = [
            'total_activities' => ActivityLog::recent($days)->count(),
            'activities_by_action' => ActivityLog::recent($days)
                ->selectRaw('action, count(*) as count')
                ->groupBy('action')
                ->get(),
            'activities_by_user' => ActivityLog::recent($days)
                ->with('user:id,name,lastName')
                ->selectRaw('user_id, count(*) as count')
                ->groupBy('user_id')
                ->get(),
            'activities_by_model' => ActivityLog::recent($days)
                ->selectRaw('model_type, count(*) as count')
                ->groupBy('model_type')
                ->get(),
            'recent_activities' => ActivityLog::with(['user' => function($q) {
                $q->select('id', 'name', 'lastName');
            }])
            ->recent($days)
            ->limit(10)
            ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function getModelHistory($modelType, $modelId)
    {
        $logs = ActivityLog::byModel($modelType, $modelId)
            ->with(['user' => function($q) {
                $q->select('id', 'name', 'lastName');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
