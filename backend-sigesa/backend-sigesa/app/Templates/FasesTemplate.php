<?php

namespace App\Templates;

class FasesTemplate
{
    public static function getTemplate()
    {
        return [
            [
                'nombre_fase' => 'Aprobación del HCF HCC',
                'descripcion_fase' => 'De nombramiento a Entrega de CEUB',
                'subfases' => [
                    [
                        'nombre_subfase' => 'Recolección de datos de las diferentes unidades',
                        'descripcion_subfase' => 'Recolección de datos de las diferentes unidades para el llenado de formularios del marco de referencias del SNEA.',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Diagnostico en base a los estandares del SNEA',
                        'descripcion_subfase' => 'Diagnostico en base a los datos obtenidos para la realización de los documentos del proceso de autoevaluación para la acreditación',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Analisis foda',
                        'descripcion_subfase' => 'Analisis Foda en base a metodologias cualitativa y cuantitativa',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Realizacion de documentos de autoevaluacion',
                        'descripcion_subfase' => '1. Informe final de la autoevaluación 2. Llenado de formularios 3. Plan de mejoras 
                                                    4. Plan de desarrollo de la carrera y/o facultativo 5. Plan de estudios',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Revisión de los documentos por la DUEA',
                        'descripcion_subfase' => 'Revisión de los documentos y visto bueno por la Dirección Universitaria de Evaluación y Acreditación',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Remisión de documentos a la CEUB',
                        'descripcion_subfase' => 'Remisión de documentos a la CEUB se adjunta nota de remisión de rectorado',
                        'estado_subfase' => false
                    ]
                ]
            ],
            [
                'nombre_fase' => 'Fase alterna Proyecto IDH',
                'descripcion_fase' => 'Proyecto IDH para el proceso de autoevaluación con miras a la acreditación, tiene el objetivo de cuplir la meta de su plan operativo anual',
                'subfases' => [
                    [
                        'nombre_subfase' => 'Responsable IDH',
                        'descripcion_subfase' => 'Designación de un responsable IDH para el seguimiento del proyecto Seguir los pasos del reglamento para la elaboración del proyecto IDH',
                        'estado_subfase' => false
                    ]
                ]
            ]
        ];
    }
}