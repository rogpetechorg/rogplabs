SELECT payload->'properties'->>'source' AS origem, payload->'properties'->>'medium' AS meio,
 payload->'properties'->>'device' AS dispositivo, payload->>'path' AS pagina,
 count(*) AS visualizacoes, count(DISTINCT payload->>'sessionId') AS sessoes
FROM gateway_events WHERE source='urn:rogpe:rogplabs:production' AND payload->>'brand'='rogpLabs'
 AND payload->>'name'='page_view' AND event_time>=now()-interval '30 days'
GROUP BY 1,2,3,4 ORDER BY visualizacoes DESC;
