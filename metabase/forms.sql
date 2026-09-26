WITH sessions AS (
 SELECT payload->>'sessionId' AS session_id, payload->'properties'->>'form' AS formulario,
 bool_or(payload->>'name'='form_start') AS iniciou,
 bool_or(payload->>'name'='form_submit') AS enviou,
 bool_or(payload->>'name'='form_success') AS concluiu,
 bool_or(payload->>'name'='form_error') AS houve_erro,
 bool_or(payload->>'name'='form_abandon') AS houve_saida
 FROM gateway_events
 WHERE source='urn:rogpe:rogplabs:production' AND payload->>'brand'='rogpLabs' AND event_time>=now()-interval '30 days'
 AND nullif(payload->>'sessionId','') IS NOT NULL AND payload->'properties'->>'form' IS NOT NULL
 GROUP BY 1,2
)
SELECT formulario, count(*) FILTER (WHERE iniciou) AS sessoes_iniciadas,
 count(*) FILTER (WHERE enviou) AS sessoes_com_envio,
 count(*) FILTER (WHERE concluiu) AS sessoes_com_sucesso,
 count(*) FILTER (WHERE houve_erro) AS sessoes_com_erro,
 count(*) FILTER (WHERE iniciou AND houve_saida AND NOT concluiu) AS saidas_sem_sucesso_observado
FROM sessions GROUP BY formulario;
