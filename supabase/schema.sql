-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    subscription_status TEXT DEFAULT 'trial',
    trial_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    PRIMARY KEY (id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    transaction_reference TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    incorrect_answers TEXT[] NOT NULL,
    explanation TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    category TEXT NOT NULL,
    times_shown INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_shown TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create bug_reports table
CREATE TABLE IF NOT EXISTS bug_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT NOT NULL,
    device_info TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create study_progress table
CREATE TABLE IF NOT EXISTS study_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    study_time_minutes INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, category)
);

-- Create push_tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, token)
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    study_reminders BOOLEAN DEFAULT true,
    reminder_time TIME,
    reminder_days INTEGER[], -- Array of days (0-6, where 0 is Sunday)
    exam_prep_notifications BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reference TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    email TEXT NOT NULL,
    metadata JSONB,
    status TEXT NOT NULL,
    provider TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view own documents"
    ON documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
    ON documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
    ON documents FOR DELETE
    USING (auth.uid() = user_id);

-- Questions policies
CREATE POLICY "Users can view questions from their documents"
    ON questions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM documents
        WHERE documents.id = questions.document_id
        AND documents.user_id = auth.uid()
    ));

-- Messages policies
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Bug reports policies
CREATE POLICY "Users can view own bug reports"
    ON bug_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bug reports"
    ON bug_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "Users can insert own analytics events"
    ON analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics events"
    ON analytics_events FOR SELECT
    USING (auth.uid() = user_id);

-- Study progress policies
CREATE POLICY "Users can view own study progress"
    ON study_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own study progress"
    ON study_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study progress"
    ON study_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Push tokens policies
CREATE POLICY "Users can manage own push tokens"
    ON push_tokens FOR ALL
    USING (auth.uid() = user_id);

-- Notification settings policies
CREATE POLICY "Users can manage own notification settings"
    ON notification_settings FOR ALL
    USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_progress_updated_at
    BEFORE UPDATE ON study_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_tokens_updated_at
    BEFORE UPDATE ON push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
