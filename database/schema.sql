-- ============================================================================
-- Callisi Dashboard - Complete Database Schema
-- Multi-tenant LiveKit Voice Agent Dashboard with RLS
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations (Multi-tenant support)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    theme_json JSONB DEFAULT '{"primary_color": "#316bfe"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Memberships (User-Organization relationship with roles)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'agent', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(org_id, user_id)
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_new_call BOOLEAN DEFAULT true,
    email_task_assigned BOOLEAN DEFAULT true,
    email_employee_invited BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- LiveKit Projects (per organization)
CREATE TABLE IF NOT EXISTS livekit_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    api_key TEXT NOT NULL,
    api_secret TEXT NOT NULL,
    webhook_secret TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Voice Agents
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    livekit_project_id UUID REFERENCES livekit_projects(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    external_id TEXT,
    prompt TEXT,
    language TEXT DEFAULT 'de-DE',
    voice TEXT DEFAULT 'de-DE-KatjaNeural',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Calls
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    caller_name TEXT,
    caller_phone TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER) STORED,
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    recording_url TEXT,
    external_ref TEXT,
    call_status TEXT CHECK (call_status IN ('completed', 'missed', 'forwarded', 'failed')) DEFAULT 'completed',
    forwarded_to TEXT,
    sms_sent BOOLEAN DEFAULT false,
    whatsapp_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Call Transcripts
CREATE TABLE IF NOT EXISTS call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    seq INTEGER NOT NULL,
    speaker TEXT NOT NULL CHECK (speaker IN ('agent', 'caller', 'system')),
    text TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(call_id, seq)
);

-- Create index for full-text search on transcripts
CREATE INDEX IF NOT EXISTS idx_transcripts_text_search ON call_transcripts USING gin(to_tsvector('german', text));
CREATE INDEX IF NOT EXISTS idx_transcripts_call_id ON call_transcripts(call_id);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    assignee_employee_id UUID,
    due_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'agent')) DEFAULT 'agent',
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(org_id, email)
);

-- Agent Logs
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error')),
    event TEXT NOT NULL,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_calls_org_id ON calls(org_id);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_tags ON calls USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_org_id ON employees(org_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_org_id ON agent_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE livekit_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_orgs(user_uuid UUID)
RETURNS TABLE(org_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT m.org_id
    FROM memberships m
    WHERE m.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations: Users can only see organizations they belong to
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (id IN (SELECT get_user_orgs(auth.uid())));

CREATE POLICY "Users can update their organizations if admin or owner"
    ON organizations FOR UPDATE
    USING (
        id IN (
            SELECT org_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Users: Users can view all users, but only update themselves
CREATE POLICY "Users can view all users"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (id = auth.uid());

-- Memberships: Users can view memberships in their organizations
CREATE POLICY "Users can view memberships in their orgs"
    ON memberships FOR SELECT
    USING (org_id IN (SELECT get_user_orgs(auth.uid())));

CREATE POLICY "Admins can manage memberships"
    ON memberships FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Notification Preferences: Users can manage their own preferences
CREATE POLICY "Users can view their own notification preferences"
    ON user_notification_preferences FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
    ON user_notification_preferences FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
    ON user_notification_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- LiveKit Projects: Organization members can view
CREATE POLICY "Members can view org livekit projects"
    ON livekit_projects FOR SELECT
    USING (org_id IN (SELECT get_user_orgs(auth.uid())));

CREATE POLICY "Admins can manage livekit projects"
    ON livekit_projects FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Agents: Organization members can view
CREATE POLICY "Members can view org agents"
    ON agents FOR SELECT
    USING (org_id IN (SELECT get_user_orgs(auth.uid())));

CREATE POLICY "Admins can manage agents"
    ON agents FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Calls: Organization members can view
CREATE POLICY "Members can view org calls"
    ON calls FOR SELECT
    USING (org_id IN (SELECT get_user_orgs(auth.uid())));

CREATE POLICY "Admins and managers can manage calls"
    ON calls FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Call Transcripts: Can view if they can view the call
CREATE POLICY "Members can view transcripts of accessible calls"
    ON call_transcripts FOR SELECT
    USING (
        call_id IN (
            SELECT id FROM calls 
            WHERE org_id IN (SELECT get_user_orgs(auth.uid()))
        )
    );

-- Tasks: Organization members can view
CREATE POLICY "Members can view org tasks"
    ON tasks FOR SELECT
    USING (org_id IN (SELECT get_user_orgs(auth.uid())));

CREATE POLICY "Members can create tasks"
    ON tasks FOR INSERT
    WITH CHECK (org_id IN (SELECT get_user_orgs(auth.uid())));

CREATE POLICY "Members can update tasks"
    ON tasks FOR UPDATE
    USING (org_id IN (SELECT get_user_orgs(auth.uid())));

CREATE POLICY "Admins can delete tasks"
    ON tasks FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Employees: Organization members can view
CREATE POLICY "Members can view org employees"
    ON employees FOR SELECT
    USING (org_id IN (SELECT get_user_orgs(auth.uid())));

CREATE POLICY "Admins can manage employees"
    ON employees FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Agent Logs: Organization members can view
CREATE POLICY "Members can view org agent logs"
    ON agent_logs FOR SELECT
    USING (org_id IN (SELECT get_user_orgs(auth.uid())));

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_livekit_projects_updated_at BEFORE UPDATE ON livekit_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user record on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    -- Create default notification preferences
    INSERT INTO public.user_notification_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to auto-generate tags from transcript
CREATE OR REPLACE FUNCTION generate_call_tags(call_uuid UUID)
RETURNS TEXT[] AS $$
DECLARE
    transcript_text TEXT;
    tags TEXT[];
BEGIN
    -- Get full transcript
    SELECT string_agg(text, ' ') INTO transcript_text
    FROM call_transcripts
    WHERE call_id = call_uuid;
    
    -- Initialize tags array
    tags := ARRAY[]::TEXT[];
    
    -- Check for common keywords (German)
    IF transcript_text ILIKE '%termin%' OR transcript_text ILIKE '%buchung%' THEN
        tags := array_append(tags, 'Buchung');
    END IF;
    
    IF transcript_text ILIKE '%stornierung%' OR transcript_text ILIKE '%absage%' THEN
        tags := array_append(tags, 'Stornierung');
    END IF;
    
    IF transcript_text ILIKE '%beschwerde%' OR transcript_text ILIKE '%problem%' THEN
        tags := array_append(tags, 'Beschwerde');
    END IF;
    
    IF transcript_text ILIKE '%anfrage%' OR transcript_text ILIKE '%information%' THEN
        tags := array_append(tags, 'Anfrage');
    END IF;
    
    IF transcript_text ILIKE '%preis%' OR transcript_text ILIKE '%kosten%' THEN
        tags := array_append(tags, 'Preis');
    END IF;
    
    RETURN tags;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Note: In production, organizations and users are created through the application
-- This is just an example for development/testing

-- ============================================================================
-- GRANTS (Make sure service role can bypass RLS for API operations)
-- ============================================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant all on tables to service_role (for API operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant select/insert/update/delete to authenticated users (RLS will control access)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
