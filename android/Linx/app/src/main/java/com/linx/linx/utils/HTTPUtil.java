package com.linx.linx.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class HTTPUtil {

    // TODO: throw custom exception on failure (define exception and enum)

    private final static String METHOD_POST = "POST";
    private final static String METHOD_GET = "GET";

    public static void get() {

    }

    public static String post(String urlStr, String jsonMessage) {
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

            if (conn.getResponseCode() != HttpURLConnection.HTTP_CREATED) {
                return "Failed : HTTP error code : " + conn.getResponseCode();
            }

            BufferedReader br = new BufferedReader(new InputStreamReader((conn.getInputStream())));

            String output;
            //System.out.println("Output from Server .... \n");
            while ((output = br.readLine()) != null) {
                //System.out.println(output);
                ret = ret + output;
            }

            conn.disconnect();

        } catch (MalformedURLException e) {
            e.printStackTrace();
            ret = "malformed url";

        } catch (IOException e) {
            e.printStackTrace();
            ret = "io error";
        }
        return ret;
    }

}
