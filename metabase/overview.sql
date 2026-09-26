SELECT count(DISTINCT nullif(payload->>'sessionId','')) FILTER (WHERE payload->>'name'='page_view') AS sessoes_consentidas,
 count(*) FILTER (WHERE payload->>'name'='click') AS cliques,
 count(*) FILTER (WHERE payload->>'name'='form_success' AND payload->'properties'->>'form'='newsletter') AS inscricoes_enviadas_nao_confirmadas,
 count(*) FILTER (WHERE payload->>'name'='lead_received') AS solicitacoes_recebidas,
 count(*) FILTER (WHERE payload->>'name'='crm_delivered') AS entregues_ao_crm
FROM gateway_events WHERE source='urn:rogpe:rogplabs:production' AND payload->>'brand'='rogpLabs' AND event_time>=now()-interval '30 days';
