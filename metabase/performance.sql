SELECT payload->>'path' AS pagina, payload->'properties'->>'metric' AS amostra,
 count(*) AS observacoes,
 percentile_cont(0.75) WITHIN GROUP (ORDER BY (payload->'properties'->>'value')::numeric) AS p75
FROM gateway_events WHERE source='urn:rogpe:rogplabs:production' AND payload->>'brand'='rogpLabs'
 AND payload->>'name'='web_vital' AND event_time>=now()-interval '30 days'
GROUP BY 1,2;
