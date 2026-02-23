using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class Leaderboard : MonoBehaviour
{
    [SerializeField] private NetworkManager networkManager;

    private GUIStyle _headerStyle;
    private GUIStyle _rowStyle;
    private GUIStyle _localRowStyle;
    private GUIStyle _nameStyle;
    private Texture2D _bgTexture;
    private bool _stylesInitialized;

    private void InitStyles()
    {
        if (_stylesInitialized) return;

        _headerStyle = new GUIStyle(GUI.skin.label)
        {
            fontSize = 16,
            fontStyle = FontStyle.Bold,
            alignment = TextAnchor.MiddleCenter
        };
        _headerStyle.normal.textColor = Color.white;

        _rowStyle = new GUIStyle(GUI.skin.label)
        {
            fontSize = 14,
            alignment = TextAnchor.MiddleCenter
        };
        _rowStyle.normal.textColor = new Color(0.9f, 0.9f, 0.9f);

        _localRowStyle = new GUIStyle(_rowStyle);
        _localRowStyle.normal.textColor = new Color(0.4f, 0.9f, 1f);

        _nameStyle = new GUIStyle(_rowStyle) { alignment = TextAnchor.MiddleLeft };

        _bgTexture = new Texture2D(1, 1);
        _bgTexture.SetPixel(0, 0, new Color(0, 0, 0, 0.75f));
        _bgTexture.Apply();

        _stylesInitialized = true;
    }

    void OnGUI()
    {
        if (!Input.GetKey(KeyCode.Tab) || networkManager == null) return;

        InitStyles();

        float w = 400, rowH = 28;
        var stats = networkManager.playerStats
            .OrderByDescending(kv => kv.Value.kills)
            .ThenBy(kv => kv.Value.deaths)
            .ToList();

        float h = 40 + rowH * (stats.Count + 1);
        float x = (Screen.width - w) / 2f;
        float y = (Screen.height - h) / 2f;

        // Background
        GUI.DrawTexture(new Rect(x, y, w, h), _bgTexture);

        // Title
        GUI.Label(new Rect(x, y + 4, w, 30), "LEADERBOARD", _headerStyle);

        float colName = x + 10;
        float colKills = x + w * 0.6f;
        float colDeaths = x + w * 0.8f;
        float rowY = y + 36;

        // Column headers
        GUI.Label(new Rect(colName, rowY, 200, rowH), "Player", _headerStyle);
        GUI.Label(new Rect(colKills, rowY, 60, rowH), "K", _headerStyle);
        GUI.Label(new Rect(colDeaths, rowY, 60, rowH), "D", _headerStyle);
        rowY += rowH;

        // Player rows
        foreach (var kv in stats)
        {
            bool isLocal = kv.Key == networkManager._username;
            var style = isLocal ? _localRowStyle : _rowStyle;
            var nStyle = new GUIStyle(_nameStyle);
            nStyle.normal.textColor = style.normal.textColor;
            GUI.Label(new Rect(colName, rowY, 200, rowH), isLocal ? kv.Key + " (you)" : kv.Key, nStyle);
            GUI.Label(new Rect(colKills, rowY, 60, rowH), kv.Value.kills.ToString(), style);
            GUI.Label(new Rect(colDeaths, rowY, 60, rowH), kv.Value.deaths.ToString(), style);
            rowY += rowH;
        }
    }
}
