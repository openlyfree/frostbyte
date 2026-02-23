using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;
using UnityEngine.Serialization;
using UnityEngine.UI;
using UnityEngine.UIElements;
using Button = UnityEngine.UI.Button;

public class Lobby : MonoBehaviour
{
    public string server; // lowercase string is standard
    public InputField userInput;
    public Button playButton;
    public Text playButtonText;

    void Start()
    {
        if (PlayerPrefs.HasKey("user"))
        {
            userInput.text = PlayerPrefs.GetString("user");
        }
    }


    IEnumerator CheckUserAvailability(string uri)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Get(uri))
        {
            yield return webRequest.SendWebRequest();

            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                PlayerPrefs.SetString("user", userInput.text);
                playButton.interactable = true;
            }
            else
            {
                playButtonText.text = "Username Taken";
                playButton.interactable = false;
            }
        }
    }

    public void OnClickStartGame()
    {
        SceneManager.LoadSceneAsync("FFA");
    }
}