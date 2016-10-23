package com.linx.linx.utils;

import android.os.AsyncTask;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class HTTPTask extends AsyncTask<String, Void, String> {

    public final static String METHOD_POST = "POST";
    public final static String METHOD_GET = "GET";

    public interface HTTPTaskResponse {
        void processFinish(String output);
    }

    public HTTPTaskResponse delegate = null;

    public HTTPTask(HTTPTaskResponse delegate) {
        this.delegate = delegate;
    }

    @Override
    protected String doInBackground(String... params) {
        if (params.length < 2) {
            return "Invalid number of parameters.";
        }

        if (params[0].equals(METHOD_POST)) {
            return post(params[1], params[2]);
        } else if (params[0].equals(METHOD_GET)) {
            get(params[1]);
        } else {
            return "Invalid method.";
        }

        return null;
    }

    @Override
    protected void onPostExecute(String result) {
        delegate.processFinish(result);
    }

    private static void get(String urlStr) {

    }

    private static String post(String urlStr, String jsonMessage) {
        String ret = "";
        try {

            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod(METHOD_POST);
            conn.setRequestProperty("Content-Type", "application/json");

            OutputStream os = conn.getOutputStream();
            os.write(jsonMessage.getBytes());
            os.flush();

            if (conn.getResponseCode() != HttpURLConnection.HTTP_CREATED
                    && conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
                Log.d("NETUTILS", "Failed : HTTP error code : " + conn.getResponseCode());
                return "Failed : HTTP error code : " + conn.getResponseCode();
            }

            BufferedReader br = new BufferedReader(new InputStreamReader((conn.getInputStream())));

            String output;
            while ((output = br.readLine()) != null) {
                ret = ret + output;
            }

            conn.disconnect();

        } catch (MalformedURLException e) {
            Log.d("NETUTILS", Log.getStackTraceString(e));
            ret = "malformed url";

        } catch (IOException e) {
            Log.d("NETUTILS", Log.getStackTraceString(e));
            ret = "io error";
        }
        return ret;
    }

}
