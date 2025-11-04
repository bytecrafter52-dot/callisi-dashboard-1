-- Add invitation fields to employees table

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS invitation_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_employees_invitation_token ON employees(invitation_token);

COMMENT ON COLUMN employees.invitation_token IS 'Unique token for employee invitation link';
COMMENT ON COLUMN employees.invitation_sent_at IS 'When the invitation email was sent';
COMMENT ON COLUMN employees.invitation_expires_at IS 'When the invitation expires (typically 7 days)';
