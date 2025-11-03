-- ========================================
-- CALLISI DASHBOARD - SAMPLE DATA
-- Pre-filled with your org_id!
-- ========================================

-- ========================================
-- SAMPLE EMPLOYEES
-- ========================================
INSERT INTO employees (org_id, full_name, email, phone, role, is_active, invited_at)
VALUES
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'Sarah Schmidt', 'sarah.schmidt@callisi.de', '+49 151 12345678', 'admin', true, NOW()),
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'Michael Weber', 'michael.weber@callisi.de', '+49 152 23456789', 'manager', true, NOW()),
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'Anna Müller', 'anna.mueller@callisi.de', '+49 153 34567890', 'agent', true, NOW()),
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'Thomas Fischer', 'thomas.fischer@callisi.de', '+49 154 45678901', 'agent', true, NOW()),
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'Julia Hoffmann', 'julia.hoffmann@callisi.de', '+49 155 56789012', 'agent', true, NOW());


-- ========================================
-- SAMPLE CALLS
-- ========================================
INSERT INTO calls (org_id, external_ref, caller_name, caller_phone, started_at, ended_at, call_status, summary, tags)
VALUES
  -- Today's calls
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-001', 'Max Mustermann', '+49 170 1234567', 
   NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes', 
   'completed', 
   'Kunde fragte nach Produktinformationen. Alle Fragen beantwortet. Follow-up terminiert.',
   ARRAY['produkt-anfrage', 'zufrieden', 'follow-up']),
  
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-002', 'Lisa Wagner', '+49 171 2345678',
   NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours' + INTERVAL '8 minutes',
   'completed',
   'Beschwerde über verspätete Lieferung. Problem gelöst, Entschuldigung angeboten.',
   ARRAY['beschwerde', 'geloest', 'lieferung']),
  
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-003', 'Peter Klein', '+49 172 3456789',
   NOW() - INTERVAL '6 hours', NULL,
   'missed',
   NULL,
   ARRAY['verpasst']),
  
  -- Yesterday's calls
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-004', 'Maria Becker', '+49 173 4567890',
   NOW() - INTERVAL '1 day' - INTERVAL '3 hours', NOW() - INTERVAL '1 day' - INTERVAL '3 hours' + INTERVAL '12 minutes',
   'completed',
   'Interessent für Premium-Paket. Angebot versendet. Sehr interessiert.',
   ARRAY['vertrieb', 'premium', 'interessiert']),
  
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-005', 'Stefan Meyer', '+49 174 5678901',
   NOW() - INTERVAL '1 day' - INTERVAL '5 hours', NOW() - INTERVAL '1 day' - INTERVAL '5 hours' + INTERVAL '6 minutes',
   'forwarded',
   'An Fachabteilung weitergeleitet für technische Beratung.',
   ARRAY['technisch', 'weitergeleitet']),
  
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-006', 'Claudia Richter', '+49 175 6789012',
   NOW() - INTERVAL '1 day' - INTERVAL '7 hours', NOW() - INTERVAL '1 day' - INTERVAL '7 hours' + INTERVAL '15 minutes',
   'completed',
   'Vertragsverlängerung besprochen. Kunde ist sehr zufrieden. Deal abgeschlossen.',
   ARRAY['vertrag', 'erfolgreich', 'zufrieden']),
  
  -- Older calls
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-007', 'Hans Schmidt', '+49 176 7890123',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '7 minutes',
   'completed',
   'Allgemeine Produktberatung. Kunde benötigt Bedenkzeit.',
   ARRAY['beratung', 'bedenkzeit']),
  
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-008', 'Sabine Wolf', '+49 177 8901234',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '9 minutes',
   'completed',
   'Zahlungsproblem geklärt. Rechnung neu versendet.',
   ARRAY['zahlung', 'geloest']),
  
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-009', 'Frank Zimmermann', '+49 178 9012345',
   NOW() - INTERVAL '4 days', NULL,
   'failed',
   NULL,
   ARRAY['fehlgeschlagen']),
  
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'call-010', 'Petra Krause', '+49 179 0123456',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '18 minutes',
   'completed',
   'Neukunde. Umfassende Produktvorstellung. Bestellung aufgegeben.',
   ARRAY['neukunde', 'bestellung', 'erfolgreich']);


-- ========================================
-- SAMPLE TRANSCRIPTS FOR CALL-001
-- ========================================
INSERT INTO call_transcripts (call_id, seq, speaker, text, started_at)
SELECT 
  id as call_id,
  1 as seq,
  'caller' as speaker,
  'Guten Tag, ich hätte gerne Informationen zu Ihren Produkten.' as text,
  started_at as started_at
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 2, 'agent',
  'Guten Tag! Sehr gerne. Für welches Produkt interessieren Sie sich denn konkret?',
  started_at + INTERVAL '5 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 3, 'caller',
  'Ich suche eine Lösung für Kundenservice-Automatisierung mit KI.',
  started_at + INTERVAL '12 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 4, 'agent',
  'Perfekt! Unser Callisi Voice AI System ist genau dafür entwickelt. Es kann Anrufe automatisch entgegennehmen, häufige Fragen beantworten und bei Bedarf an Mitarbeiter weiterleiten.',
  started_at + INTERVAL '20 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 5, 'caller',
  'Das klingt interessant. Wie funktioniert die Integration?',
  started_at + INTERVAL '38 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 6, 'agent',
  'Die Integration ist sehr einfach. Wir richten eine Telefonnummer ein, die zu unserem System weitergeleitet wird. Sie können das System in wenigen Minuten konfigurieren und individuell anpassen.',
  started_at + INTERVAL '48 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 7, 'caller',
  'Verstehe. Und wie steht es mit den Kosten?',
  started_at + INTERVAL '72 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 8, 'agent',
  'Wir haben verschiedene Pakete. Das Starter-Paket beginnt bei 299 Euro monatlich für bis zu 500 Anrufe. Möchten Sie, dass ich Ihnen ein detailliertes Angebot zusende?',
  started_at + INTERVAL '80 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 9, 'caller',
  'Ja, das wäre super. Können wir auch einen Demo-Termin vereinbaren?',
  started_at + INTERVAL '100 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 10, 'agent',
  'Selbstverständlich! Ich trage Sie für morgen um 14 Uhr ein. Sie erhalten gleich eine Bestätigungsmail mit allen Details.',
  started_at + INTERVAL '110 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 11, 'caller',
  'Perfekt, vielen Dank für die Informationen!',
  started_at + INTERVAL '130 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 12, 'agent',
  'Sehr gerne! Ich freue mich auf unseren Demo-Termin morgen. Auf Wiederhören!',
  started_at + INTERVAL '138 seconds'
FROM calls WHERE external_ref = 'call-001' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c';


-- ========================================
-- SAMPLE TRANSCRIPTS FOR CALL-002
-- ========================================
INSERT INTO call_transcripts (call_id, seq, speaker, text, started_at)
SELECT 
  id, 1, 'caller',
  'Hallo, ich rufe wegen meiner Bestellung an. Die Lieferung sollte schon vor drei Tagen ankommen!',
  started_at
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 2, 'agent',
  'Guten Tag! Das tut mir sehr leid. Lassen Sie mich das sofort für Sie prüfen. Können Sie mir bitte Ihre Bestellnummer nennen?',
  started_at + INTERVAL '8 seconds'
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 3, 'caller',
  'Die Nummer ist BE-2024-1234.',
  started_at + INTERVAL '20 seconds'
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 4, 'agent',
  'Einen Moment bitte... Ich sehe hier, dass es bei der Zustellung eine Verzögerung gab. Das Paket befindet sich aktuell im Verteilzentrum und wird heute noch ausgeliefert.',
  started_at + INTERVAL '28 seconds'
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 5, 'caller',
  'Heute noch? Können Sie das garantieren?',
  started_at + INTERVAL '52 seconds'
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 6, 'agent',
  'Ja, ich habe gerade mit dem Logistik-Team gesprochen. Die Lieferung ist für heute zwischen 14 und 18 Uhr eingeplant. Zur Entschuldigung für die Verzögerung möchte ich Ihnen einen 20% Gutschein für Ihre nächste Bestellung anbieten.',
  started_at + INTERVAL '60 seconds'
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 7, 'caller',
  'Okay, das ist fair. Danke für die schnelle Hilfe.',
  started_at + INTERVAL '88 seconds'
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 8, 'agent',
  'Sehr gerne! Sie erhalten den Gutscheincode per E-Mail. Gibt es noch etwas, womit ich Ihnen helfen kann?',
  started_at + INTERVAL '96 seconds'
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 9, 'caller',
  'Nein, das war alles. Vielen Dank!',
  started_at + INTERVAL '110 seconds'
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
UNION ALL
SELECT 
  id, 10, 'agent',
  'Gerne! Einen schönen Tag noch. Auf Wiederhören!',
  started_at + INTERVAL '116 seconds'
FROM calls WHERE external_ref = 'call-002' AND org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c';


-- ========================================
-- SAMPLE TASKS
-- ========================================
INSERT INTO tasks (org_id, title, description, status, assignee_employee_id, due_at, created_by, call_id)
SELECT 
  '6ffc00e1-85b8-4071-9df4-b3ed659ec46c',
  'Follow-up Anruf - Max Mustermann',
  'Demo-Termin vorbereiten und Angebot erstellen für Premium-Paket.',
  'pending',
  e.id,
  NOW() + INTERVAL '1 day',
  '378f6f83-fe6d-4b65-a730-29a8a07e27b0',
  c.id
FROM employees e
CROSS JOIN calls c
WHERE e.full_name = 'Anna Müller' 
  AND c.external_ref = 'call-001'
  AND e.org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
  AND c.org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
LIMIT 1;

INSERT INTO tasks (org_id, title, description, status, assignee_employee_id, due_at, created_by)
SELECT 
  '6ffc00e1-85b8-4071-9df4-b3ed659ec46c',
  'Technische Dokumentation aktualisieren',
  'API-Dokumentation für Version 2.0 vervollständigen.',
  'in_progress',
  e.id,
  NOW() + INTERVAL '3 days',
  '378f6f83-fe6d-4b65-a730-29a8a07e27b0'
FROM employees e
WHERE e.full_name = 'Michael Weber'
  AND e.org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
LIMIT 1;

INSERT INTO tasks (org_id, title, description, status, assignee_employee_id, due_at, created_by)
SELECT 
  '6ffc00e1-85b8-4071-9df4-b3ed659ec46c',
  'Kundenzufriedenheit-Umfrage erstellen',
  'Neue Umfrage für Q4 2024 vorbereiten und versenden.',
  'pending',
  e.id,
  NOW() + INTERVAL '5 days',
  '378f6f83-fe6d-4b65-a730-29a8a07e27b0'
FROM employees e
WHERE e.full_name = 'Sarah Schmidt'
  AND e.org_id = '6ffc00e1-85b8-4071-9df4-b3ed659ec46c'
LIMIT 1;

INSERT INTO tasks (org_id, title, description, status, created_by)
VALUES
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'Vertriebsziele Review', 'Monatliche Vertriebszahlen analysieren und präsentieren.', 'completed', '378f6f83-fe6d-4b65-a730-29a8a07e27b0'),
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'Onboarding neuer Mitarbeiter', 'Schulungsplan für neue Teammitglieder erstellen.', 'in_progress', '378f6f83-fe6d-4b65-a730-29a8a07e27b0'),
  ('6ffc00e1-85b8-4071-9df4-b3ed659ec46c', 'Marketing Kampagne Q1', 'Social Media Posts und Newsletter vorbereiten.', 'pending', '378f6f83-fe6d-4b65-a730-29a8a07e27b0');


-- ========================================
-- DONE! 
-- ========================================
-- Your dashboard now has:
-- ✅ 5 Sample Employees
-- ✅ 10 Sample Calls (with different statuses)
-- ✅ 22 Sample Transcript Messages (for 2 calls)
-- ✅ 6 Sample Tasks (in different statuses)
--
-- Now refresh your dashboard to see the data!
