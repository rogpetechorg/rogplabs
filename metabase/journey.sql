SELECT payload->>'path' AS pagina, payload->>'name' AS evento,
 payload->'properties'->>'section' AS secao, payload->'properties'->>'target' AS alvo,
 payload->'properties'->>'destination' AS destino, payload->'properties'->>'field' AS campo,
 count(*) AS eventos, count(DISTINCT nullif(payload->>'sessionId','')) AS sessoes,
 max((payload->'properties'->>'depth')::numeric) AS profundidade_maxima,
 round(avg((payload->'properties'->>'activeSeconds')::numeric),1) AS segundos_ativos_medios
FROM gateway_events WHERE source='urn:rogpe:rogplabs:production' AND payload->>'brand'='rogpLabs' AND event_time>=now()-interval '30 days'
GROUP BY 1,2,3,4,5,6 ORDER BY eventos DESC;
