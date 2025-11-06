<?php

namespace App\Templates;

class FasesArcusurTemplate
{
    public static function getTemplate()
    {
        return [
            [
                'nombre_fase' => 'Proceso de Autoevaluación',
                'descripcion_fase' => 'el proceso de autoevaluacion de la carrera tiene una duracion de 6 meses, 
                                        donde este proceso concluye con la presentacion del informe de autoevaluacion de la carrera, 
                                        plan de mejoras de la carrera, formulario de recoleccion de datos y documentos de verificacion (carpetas)',
                'subfases' => [
                    [
                        'nombre_subfase' => 'Solicitud de la Carrera de ir aun proceso de autoevaluacion',
                        'descripcion_subfase' => 'La carrera debe mandar una nota dirigida a la directoras de la DUEA acompañado con su resolución de 
                                                consejo de carrera de aceptar en participar en la convocatoria de acreditación del CNACU.',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Etapa de capacitacion y conformacion de la comision de autoevalacion de la carrera',
                        'descripcion_subfase' => 'La carrera debe conformar su comision de autoevaluacion y solicitar mediante nota la capacitacion 
                                                y el asesoramiento de untecnico de la duea para este proceso.',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Etapa recoleccion de la informacion',
                        'descripcion_subfase' => 'En esta etapa la carrera tiene que recolectar información por 
                                                dimesion de cada uno de los criterios de calidad que esta en la guia de criterio de calidad del ARCU SUR.',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Etapa de elaboración del informe de autoevaluación',
                        'descripcion_subfase' => 'En esta etapa en base a la documentación recolectada la carrera debe realizar el informe de autoevaluación',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Etapa de elaboración del plan de mejoras de la carrera',
                        'descripcion_subfase' => 'En base al informe de autoevalacion y mediante un taller FODA o un arbol de problemas la carrera 
                                                tiene que detectar los aspectos desfavorables por dimension de la carrera y relizar la matriz de marco logico.',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Etapa de llenado de formulario de recoleccion de datos',
                        'descripcion_subfase' => 'Llenar el formulario en base al informe de autoevaluacion',
                        'estado_subfase' => false
                    ]
                ]
            ],
            [
                'nombre_fase' => 'Proceso de Evaluación Externa con Fines de Acreditación',
                'descripcion_fase' => 'En esta fase la carrera tienen que realizar, mantenimiento de infraestructura, socialización y capacitación de docentes, 
                                    estudiantes y personal administrativo, simulacro de evaluación externa y la agenda de visita externa.',
                'subfases' => [
                    [
                        'nombre_subfase' => 'Refacción y mantenimiento de infraestructura y equipamientos de laboratorios',
                        'descripcion_subfase' => 'En esta etapa la carrera tiene que realizar las mejoras a su infraestructura y mantenimiento y 
                                                acondicionamiento de sus ambientes para la llegada de los pares evaluadores externos.',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Socialización de los documentos del proceso de autoevaluación a la comunidad universitaria de la carrera',
                        'descripcion_subfase' => 'En esta etapa la carrera tiene que desarrollar talleres de socializacion para hacer conocer a la comunidad 
                                                universitaria de su carrera los resultados del proceso de autoevalacion',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Capacitación a grupos entrevistados',
                        'descripcion_subfase' => 'En esta etapa se capacitara a los posibles entrevistados en la evaluación externa como ser estudiantes, 
                                                docentes, personal administrativo, autoridades y titulados de la carrera',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Simulacro de evaluación externa',
                        'descripcion_subfase' => 'Se realiza un simulacro de evaluación externa con docentes y personal administrativo con experiencia 
                                                como pares evaluadores.',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Preparativos para la llegada de los pares evaluadores externos',
                        'descripcion_subfase' => 'En esta etapa la carrera tiene que prepara el ambiente de los pares y la sala de reuniones, como tambien 
                                                organizar un grupo de protocolo para el recojo, estadia y regreso de los pares a sus lugares de origen',
                        'estado_subfase' => false
                    ],
                    [
                        'nombre_subfase' => 'Evaluación externa de la carrera',
                        'descripcion_subfase' => 'En esta etapa se cumplira con la agenda prevista con los pares acreditadores los 3 dias de evaluacion 
                                                que tendra la carrera',
                        'estado_subfase' => false
                    ]
                ]
            ],
            [
                'nombre_fase' => 'Proceso de Mejora Continua',
                'descripcion_fase' => 'después de la visita externa la carrera acredite o no acredite tiene que seguir con el cumplimiento de su plan de mejoras 
                                    y recomendaciones hechas por los pares evaluadores.',
                'subfases' => [
                    
                ]
            ]
        ];
    }
}