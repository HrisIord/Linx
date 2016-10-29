package com.linx.linx;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;

import com.linx.linx.utils.HTTPTask;

public class MainActivity extends AppCompatActivity implements HTTPTask.HTTPTaskResponse {

    public final static String EXTRA_MESSAGE = "com.linx.linx.MESSAGE";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    public void sendMessage(View view) {
        EditText editText = (EditText) findViewById(R.id.edit_message);
        String message = editText.getText().toString();

        HTTPTask task = new HTTPTask(this);
        task.execute(HTTPTask.METHOD_POST, "http://138.197.134.223:3000/", "{ \"url\": \"https://www.youtube.com/watch?v=OjDAU3f5YQs\" }");
    }

    @Override
    public void processFinish(String result) {
        Intent intent = new Intent(this, DisplayMessageActivity.class);
        intent.putExtra(EXTRA_MESSAGE, result);
        startActivity(intent);
    }
}
