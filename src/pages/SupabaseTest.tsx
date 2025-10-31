import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const SupabaseTest = () => {
  const [status, setStatus] = useState<any>({
    connection: 'testing...',
    tables: {},
    policies: {},
    env: {}
  });

  useEffect(() => {
    testSupabase();
  }, []);

  const testSupabase = async () => {
    const results: any = {
      connection: 'unknown',
      tables: {},
      policies: {},
      env: {
        url: import.meta.env.VITE_SUPABASE_URL,
        key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'configured' : 'missing'
      }
    };

    try {
      // Test connection
      results.connection = 'connected';

      // Test each table
      const tables = ['chalets', 'shipping_carriers', 'providers', 'links', 'payments'];
      
      for (const table of tables) {
        try {
          const { data, error, count } = await (supabase as any)
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          results.tables[table] = {
            exists: !error,
            count: count || 0,
            error: error?.message || null
          };
        } catch (e: any) {
          results.tables[table] = {
            exists: false,
            error: e.message
          };
        }
      }

      // Test insert permission on links
      try {
        const testId = crypto.randomUUID();
        const { data, error } = await (supabase as any)
          .from('links')
          .insert({
            id: testId,
            type: 'test',
            country_code: 'SA',
            payload: { test: true },
            microsite_url: 'http://test.com',
            payment_url: 'http://test.com',
            signature: 'test',
            status: 'active'
          })
          .select()
          .single();

        results.policies.canInsert = !error;
        results.policies.insertError = error?.message || null;

        // Clean up test data
        if (data) {
          await (supabase as any).from('links').delete().eq('id', testId);
        }
      } catch (e: any) {
        results.policies.canInsert = false;
        results.policies.insertError = e.message;
      }

      // Test select permission
      try {
        const { data, error } = await (supabase as any)
          .from('links')
          .select('*')
          .limit(1);

        results.policies.canSelect = !error;
        results.policies.selectError = error?.message || null;
        results.policies.sampleData = data?.[0] || null;
      } catch (e: any) {
        results.policies.canSelect = false;
        results.policies.selectError = e.message;
      }

    } catch (e: any) {
      results.connection = 'error';
      results.error = e.message;
    }

    setStatus(results);
  };

  return (
    <div className="min-h-screen p-8 bg-background" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">اختبار اتصال Supabase</h1>
        
        <Button onClick={testSupabase} className="mb-6">
          إعادة الاختبار
        </Button>

        {/* Environment Variables */}
        <div className="bg-card p-6 rounded-lg mb-6 border border-border">
          <h2 className="text-xl font-bold mb-4 text-foreground">متغيرات البيئة</h2>
          <pre className="text-sm bg-muted p-4 rounded overflow-auto" dir="ltr">
            {JSON.stringify(status.env, null, 2)}
          </pre>
        </div>

        {/* Connection Status */}
        <div className="bg-card p-6 rounded-lg mb-6 border border-border">
          <h2 className="text-xl font-bold mb-4 text-foreground">حالة الاتصال</h2>
          <p className={`text-lg font-mono ${status.connection === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
            {status.connection}
          </p>
          {status.error && (
            <p className="text-destructive mt-2">{status.error}</p>
          )}
        </div>

        {/* Tables Status */}
        <div className="bg-card p-6 rounded-lg mb-6 border border-border">
          <h2 className="text-xl font-bold mb-4 text-foreground">حالة الجداول</h2>
          <div className="space-y-3">
            {Object.entries(status.tables).map(([table, info]: [string, any]) => (
              <div key={table} className="flex justify-between items-start p-3 bg-muted rounded">
                <div>
                  <p className="font-semibold text-foreground">{table}</p>
                  {info.error && <p className="text-xs text-destructive mt-1">{info.error}</p>}
                </div>
                <div className="text-right">
                  <p className={`font-mono ${info.exists ? 'text-green-500' : 'text-red-500'}`}>
                    {info.exists ? `✓ (${info.count})` : '✗'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policies Status */}
        <div className="bg-card p-6 rounded-lg mb-6 border border-border">
          <h2 className="text-xl font-bold mb-4 text-foreground">حالة الأذونات (RLS Policies)</h2>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded">
              <p className="font-semibold text-foreground mb-2">القراءة (SELECT)</p>
              <p className={`font-mono ${status.policies.canSelect ? 'text-green-500' : 'text-red-500'}`}>
                {status.policies.canSelect ? '✓ مسموح' : '✗ محظور'}
              </p>
              {status.policies.selectError && (
                <p className="text-xs text-destructive mt-2">{status.policies.selectError}</p>
              )}
            </div>

            <div className="p-3 bg-muted rounded">
              <p className="font-semibold text-foreground mb-2">الإضافة (INSERT)</p>
              <p className={`font-mono ${status.policies.canInsert ? 'text-green-500' : 'text-red-500'}`}>
                {status.policies.canInsert ? '✓ مسموح' : '✗ محظور'}
              </p>
              {status.policies.insertError && (
                <p className="text-xs text-destructive mt-2">{status.policies.insertError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sample Data */}
        {status.policies.sampleData && (
          <div className="bg-card p-6 rounded-lg mb-6 border border-border">
            <h2 className="text-xl font-bold mb-4 text-foreground">بيانات عينة من جدول Links</h2>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto" dir="ltr">
              {JSON.stringify(status.policies.sampleData, null, 2)}
            </pre>
          </div>
        )}

        {/* Full Debug Info */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-bold mb-4 text-foreground">معلومات تشخيصية كاملة</h2>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto" dir="ltr">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;
